import AVFoundation
import Foundation

// Converte vídeo para fundo de web: resolução e taxa de bits sob controle,
// sem áudio, com o índice no começo do arquivo para o navegador começar a
// tocar antes de baixar tudo.
//
// Existe porque a máquina não tem ffmpeg nem Homebrew, e o avconvert do
// macOS não deixa escolher a taxa: ou entrega 480x270, macio demais para
// tela cheia, ou 720p a 4,8 MB, pesado demais para uma primeira dobra.
//
//   swiftc -O -framework AVFoundation -framework CoreGraphics \
//          -framework ImageIO -o converter scripts/video/Converter.swift
//   ./converter entrada.mp4 saida.mp4 1280 720 1000
//   ./converter --poster entrada.mp4 poster.png 1.2

struct Erro: LocalizedError {
    let msg: String
    var errorDescription: String? { msg }
}

func converter(entrada: URL, saida: URL, largura: Int, altura: Int, kbps: Int) throws {
    let ativo = AVURLAsset(url: entrada)
    guard let trilha = ativo.tracks(withMediaType: .video).first else {
        throw Erro(msg: "sem trilha de vídeo")
    }

    try? FileManager.default.removeItem(at: saida)

    let leitor = try AVAssetReader(asset: ativo)
    let saidaLeitor = AVAssetReaderTrackOutput(
        track: trilha,
        outputSettings: [kCVPixelBufferPixelFormatTypeKey as String:
                            kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange]
    )
    leitor.add(saidaLeitor)

    let escritor = try AVAssetWriter(outputURL: saida, fileType: .mp4)
    // Põe o índice no início: sem isto o navegador precisa do arquivo
    // inteiro antes do primeiro quadro.
    escritor.shouldOptimizeForNetworkUse = true

    let entradaEscritor = AVAssetWriterInput(
        mediaType: .video,
        outputSettings: [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: largura,
            AVVideoHeightKey: altura,
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: kbps * 1000,
                AVVideoMaxKeyFrameIntervalKey: 60,
                AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
                AVVideoAllowFrameReorderingKey: true,
            ],
        ]
    )
    entradaEscritor.expectsMediaDataInRealTime = false
    entradaEscritor.transform = trilha.preferredTransform
    escritor.add(entradaEscritor)

    guard leitor.startReading(), escritor.startWriting() else {
        throw Erro(msg: "não deu para começar: \(leitor.error?.localizedDescription ?? "")")
    }
    escritor.startSession(atSourceTime: .zero)

    let fila = DispatchQueue(label: "converter")
    let espera = DispatchSemaphore(value: 0)

    entradaEscritor.requestMediaDataWhenReady(on: fila) {
        while entradaEscritor.isReadyForMoreMediaData {
            guard let amostra = saidaLeitor.copyNextSampleBuffer() else {
                entradaEscritor.markAsFinished()
                escritor.finishWriting { espera.signal() }
                return
            }
            entradaEscritor.append(amostra)
        }
    }

    espera.wait()
    if escritor.status != .completed {
        throw Erro(msg: "falhou: \(escritor.error?.localizedDescription ?? "desconhecido")")
    }
}

/** Tira um quadro para servir de pôster enquanto o vídeo não chega. */
func posterizar(entrada: URL, saida: URL, segundo: Double) throws {
    let ativo = AVURLAsset(url: entrada)
    let gerador = AVAssetImageGenerator(asset: ativo)
    gerador.appliesPreferredTrackTransform = true
    gerador.requestedTimeToleranceBefore = .zero
    gerador.requestedTimeToleranceAfter = .zero

    let imagem = try gerador.copyCGImage(
        at: CMTime(seconds: segundo, preferredTimescale: 600), actualTime: nil)

    guard let destino = CGImageDestinationCreateWithURL(
        saida as CFURL, "public.png" as CFString, 1, nil) else {
        throw Erro(msg: "não deu para criar o pôster")
    }
    CGImageDestinationAddImage(destino, imagem, nil)
    guard CGImageDestinationFinalize(destino) else {
        throw Erro(msg: "não deu para gravar o pôster")
    }
}

let a = CommandLine.arguments
guard a.count >= 3 else {
    print("uso: converter <entrada> <saida.mp4> [largura] [altura] [kbps]")
    print("     converter --poster <entrada> <saida.png> [segundo]")
    exit(2)
}

do {
    if a[1] == "--poster" {
        try posterizar(entrada: URL(fileURLWithPath: a[2]),
                       saida: URL(fileURLWithPath: a[3]),
                       segundo: a.count > 4 ? Double(a[4]) ?? 0 : 0)
        print("pôster gravado")
    } else {
        try converter(entrada: URL(fileURLWithPath: a[1]),
                      saida: URL(fileURLWithPath: a[2]),
                      largura: a.count > 3 ? Int(a[3]) ?? 1280 : 1280,
                      altura: a.count > 4 ? Int(a[4]) ?? 720 : 720,
                      kbps: a.count > 5 ? Int(a[5]) ?? 900 : 900)
        print("convertido")
    }
} catch {
    print("erro: \(error.localizedDescription)")
    exit(1)
}
