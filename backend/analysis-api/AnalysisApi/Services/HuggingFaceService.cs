using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

public class HuggingFaceService
{
    private readonly HttpClient _http;

    public HuggingFaceService(HttpClient http)
    {
        _http = http;
    }

    public async Task<string> AnalyzeAsync(string prompt)
    {
        var url = "https://router.huggingface.co/v1/chat/completions";

        var payload = new
        {
            model = "Qwen/Qwen2.5-7B-Instruct:together",
            messages = new[]
            {
                new { role = "user", content = prompt }
            }
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", Environment.GetEnvironmentVariable("HF_TOKEN"));

        var response = await _http.PostAsync(url, content);

        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine("API Error:");
            Console.WriteLine(body);
            return $"HF error {response.StatusCode}";
        }

        using var doc = JsonDocument.Parse(body);

        // Response structure matches OpenAI
        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()!;
    }
}
