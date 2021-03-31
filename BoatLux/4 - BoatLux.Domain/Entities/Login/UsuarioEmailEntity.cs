using System;
using System.Collections.Generic;
using System.Text;

namespace BoatLux.Domain.Entities.Login
{
    public class UsuarioEmailEntity
    {
        public int Id { get; set; }
        public int IdUsuario { get; set; }
        public string Email { get; set; }

        public UsuarioEmailEntity(int idUsuario, string email)
        {
            IdUsuario = idUsuario;
            Email = email;
        }
    }
}
