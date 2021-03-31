using System;
using System.Collections.Generic;
using System.Text;

namespace Boatlux.Domain.Models.Login
{
    public class RequestLoginModel
    {
        public string User { get; set; }
        public string Password { get; set; }
    }
}
