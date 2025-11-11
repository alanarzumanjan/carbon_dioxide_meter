using System.Text.RegularExpressions;
using Dtos;

namespace Validation;

public class UserLoginValidator : IValidator<LoginDTO>
{
    public Dictionary<string, string> Validate(LoginDTO user)
    {
        var errors = new Dictionary<string, string>();

        // Email
        if (string.IsNullOrWhiteSpace(user.Email))
            errors["email"] = "Email is required.";
        else if (!Regex.IsMatch(user.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            errors["email"] = "Email is not valid.";

        // Password
        if (string.IsNullOrWhiteSpace(user.Password))
            errors["password"] = "Password is required.";

        return errors;
    }
}
