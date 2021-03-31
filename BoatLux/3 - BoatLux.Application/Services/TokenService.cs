using System;
using System.Collections.Generic;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Boatlux.Domain.Models.Login;
using Microsoft.Extensions.Configuration;
using BoatLux.Application.Interfaces;
using Microsoft.Extensions.Options;
using BoatLux.Infra.Options;
using System.Security.Cryptography;

namespace BoatLux.Application.Services
{
    public class TokenService : ITokenService
    {
        private readonly IOptions<MyAppSettings> _myAppSettings;

        private HashAlgorithm _hash = new SHA1CryptoServiceProvider();

        public TokenService(IOptions<MyAppSettings> myAppSettings)
        {
            _myAppSettings = myAppSettings;
        }

        public string GenerateToken(ResponseLoginModel response)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_myAppSettings.Value.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, response.Name.ToString()),
                }),
                Expires = DateTime.UtcNow.AddHours(3),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                    )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public string  CryptPassword(string password)
        {
            var encodedValue = Encoding.UTF8.GetBytes(password);
            var encryptedPassword = _hash.ComputeHash(encodedValue);

            var sb = new StringBuilder();
            foreach (var caracter in encryptedPassword)
            {
                sb.Append(caracter.ToString("X2"));
            }

            return sb.ToString();
        }
        public bool ValidPassword(string userPassword, string systemPassword)
        {
            var encryptedPassword = _hash.ComputeHash(Encoding.UTF8.GetBytes(userPassword));

            var sb = new StringBuilder();
            foreach (var caractere in encryptedPassword)
            {
                sb.Append(caractere.ToString("X2"));
            }

            return sb.ToString() == systemPassword;
        }
    }
}
