using Boatlux.Domain.Models.Login;
using BoatLux.Domain.Entities.Login;
using System;
using System.Collections.Generic;
using System.Text;

namespace BoatLux.Domain.Interfaces
{
    public interface ILoginRepository
    {
        UsuarioEntity Login(RequestLoginModel request);
        void Insert(UsuarioEntity usuario);
    }
}
