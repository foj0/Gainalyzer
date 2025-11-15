using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;
using OpenAI;

namespace AiServiceProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyzeController : ControllerBase
    {
        private readonly OpenAIClient _client;

        public AnalyzeController(IConfiguration config)
        {
            string apiKey = config["OPENAI_API_KEY"];
            _client = new OpenAIClient(apiKey);
        }

        public record AnalysisRequest(string Data);

        [HttpPost]
        public async Task<IActionResult> Analyze([FromBody] AnalysisRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Data))
                return BadRequest("No data provided");

            var chat = _client.Chat;

            var response = await chat.GetAsync(
                model: "gpt-4.1",      // You can use gpt-4o-mini if cheaper
                messages: new ChatMessage[]
                {
                    new SystemChatMessage("You are a fitness analysis expert. Give concise, actionable analysis."),
                    new UserChatMessage(request.Data)
                }
            );

            string analysis = response.Value.Content[0].Text;

            return Ok(new { analysis });
        }
    }
}
