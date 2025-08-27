namespace MedicalImageApi.Models
{
    public class ImageBuffer
    {
        public byte[] Data { get; set; } = Array.Empty<byte>();
        public int Width { get; set; }
        public int Height { get; set; }
        public int Channels { get; set; }
        public string Format { get; set; } = "RGBA";
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public double GenerationTimeMs { get; set; }
    }

    public class ImageBufferRequest
    {
        public int Width { get; set; } = 1000;
        public int Height { get; set; } = 1000;
        public string ImageType { get; set; } = "medical"; // "medical", "test", "noise"
        public int Channels { get; set; } = 4;
    }

    public class PerformanceMetrics
    {
        public double GenerationTimeMs { get; set; }
        public long MemoryUsedBytes { get; set; }
        public int BufferSizeBytes { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}