using Boatlux.Domain.Models.Login;
using BoatLux.Domain.Entities.Login;
using BoatLux.Infra.Options;
using Dapper;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BoatLux.Infra.DapperContext
{
    public class UsuarioContext
    {
        private readonly IOptions<MyAppSettings> _myAppSettings;

        public UsuarioContext(IOptions<MyAppSettings> myAppSettings)
        {
            _myAppSettings = myAppSettings;
        }
        public UsuarioEntity Select(RequestLoginModel request)
        {
            using(var connection = new MySqlConnection(_myAppSettings.Value.ConnString))
            {
                var dado = connection.Query<UsuarioEntity>(
                    string.Format(
                         @"SELECT 
                            us.id, ue.email as Email, us.senha as Senha 
                          FROM 
                            usuarios us 
                            inner join usuarios_emails ue on ue.id_usuario=us.id 
                          WHERE 0=0 
                            and ue.email = '{0}'",request.User
                         )
                ).FirstOrDefault();

                return dado;
            }
        }
    }
}
