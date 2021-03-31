using Boatlux.Domain.Models.Login;
using System;
using System.Collections.Generic;
using System.Text;

namespace BoatLux.Application.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(ResponseLoginModel response);
        string CryptPassword(string password);
        bool ValidPassword(string userPassword,string systemPassword);
    }
}
