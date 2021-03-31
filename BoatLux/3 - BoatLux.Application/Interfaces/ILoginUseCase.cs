using Boatlux.Domain.Models.Login;
using BoatLux.Domain.Entities.Login;
using System;
using System.Collections.Generic;
using System.Text;

namespace BoatLux.Application.Interfaces
{
    public interface ILoginUseCase
    {
        ResponseLoginModel Login(RequestLoginModel request);

        UsuarioEntity Insert(UsuarioEntity usuario);
    }
}
