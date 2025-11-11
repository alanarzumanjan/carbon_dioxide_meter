using System.Text.RegularExpressions;
using Dtos;

namespace Validation;

public class UserRegisterValidator : IValidator<RegisterDTO>
{
    public Dictionary<string, string> Validate(RegisterDTO user)
    {
        var errors = new Dictionary<string, string>();

        // Email
        if (string.IsNullOrWhiteSpace(user.Email))
            errors["email"] = "Email is required.";
        else
        {
            if (user.Email.Length < 5 || user.Email.Length > 50)
                errors["email"] = "Email must be between 5 and 50 characters.";
            else if (!Regex.IsMatch(user.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                errors["email"] = "Email is not valid.";
        }

        // Password
        if (string.IsNullOrWhiteSpace(user.Password))
            errors["password"] = "Password is required.";
        else
        {
            if (user.Password.Length < 8 || user.Password.Length > 30)
                errors["password"] = "Password must be between 8 and 30 characters.";
            else if (!Regex.IsMatch(user.Password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"))
                errors["password"] = "Password must contain at least one uppercase letter, one lowercase letter, and one number.";
        }

        // Username
        if (string.IsNullOrWhiteSpace(user.Username))
            errors["username"] = "Username is required.";
        else
        {
            if (user.Username.Length < 3 || user.Username.Length > 20)
                errors["username"] = "Username must be between 3 and 20 characters.";
            else if (!Regex.IsMatch(user.Username, @"^[a-zA-Z0-9_]+$"))
                errors["username"] = "Username must contain only letters, numbers, and underscores.";
        }

        return errors;
    }
}
