using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace BoatLux.Domain.Entities.Login
{
    public class UsuarioEntity
    {
        public int Id { get; set; }
        public int IdTipo { get; set; }
        public string ApelidoFranqueado { get; set; }
        public int? IdFranqueado { get; set; }
        public int IdStatus { get; set; }
        public string Senha { get; set; }
        public DateTime? DataCadastro { get; set; }
        public string Chave { get; set; }
        public DateTime? Validade { get; set; }
        public string Referencia { get; set; }

        [NotMapped]
        public string Email { get; set; } 
        public UsuarioEntity SetDataCadastro()
        {
            DataCadastro = DateTime.Now;
            return this;
        }

        public UsuarioEntity SetSenha(string senha)
        {
            Senha = senha;
            return this;
        }
    }
}
