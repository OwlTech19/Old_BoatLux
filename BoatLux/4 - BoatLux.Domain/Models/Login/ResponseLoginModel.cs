using System;
using System.Collections.Generic;
using System.Text;

namespace Boatlux.Domain.Models.Login
{
    public class ResponseLoginModel
    {
        public int Id { get; private set; }
        public string User { get; private set; }
        public string Name { get; private set; }
        public string Password { get; private set; }
        public string Token { get; private set; }

        public ResponseLoginModel(int id, string user, string name, string token,string password)
        {
            Id = id;
            User = user;
            Name = name;
            Token = token;
            Password = password;
        }

        public void SetToken(string token) => Token = token;
    }
}
