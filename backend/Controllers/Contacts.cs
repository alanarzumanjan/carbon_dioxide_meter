using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using MimeKit;
using MailKit.Net.Smtp;

[ApiController]
[Route("[controller]")]
public class ContactsController : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult> SendMessage([FromBody] ContactsDTO form)
    {
        try
        {
            var emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            if (!string.IsNullOrEmpty(form.Email) && !Regex.IsMatch(form.Email, emailPattern))
            {
                Console.WriteLine($"Contacts email send: Invalid email format {form.Email}");
                return BadRequest("Invalid email format.");
            }

            var emailEnv = Environment.GetEnvironmentVariable("EMAIL_ADDRESS");
            var passwordEnv = Environment.GetEnvironmentVariable("EMAIL_PASSWORD");
            var nameEnv = Environment.GetEnvironmentVariable("EMAIL_NAME");

            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress(form.Name, form.Email));
            emailMessage.To.Add(new MailboxAddress(nameEnv, emailEnv));
            emailMessage.Subject = "New message from portfolio";
            emailMessage.Body = new TextPart("plain")
            {
                Text = $"Name: {form.Name}\nEmail: {form.Email}\nMessage: {form.Message}"
            };

            using var client = new SmtpClient();
            await client.ConnectAsync("smtp.gmail.com", 587, false);
            await client.AuthenticateAsync(emailEnv, passwordEnv);
            await client.SendAsync(emailMessage);
            await client.DisconnectAsync(true);

            var message = $"Message '{form.Message}' sended with email [{form.Email}]";
            Console.WriteLine(message);
            return Ok(new { message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to sending email: {ex.Message}");
            return StatusCode(500, "Failed to sending email.");
        }
    }
}