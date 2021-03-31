using Boatlux.Domain.Models.Login;
using BoatLux.Domain.Entities.Login;
using BoatLux.Domain.Interfaces;
using BoatLux.Infra.Context;
using BoatLux.Infra.DapperContext;
using BoatLux.Infra.Options;
using Microsoft.Extensions.Options;

namespace BoatLux.Infra.Repositories
{
    public class LoginRepository : ILoginRepository
    {
        private readonly DBContext _context;
        private readonly IOptions<MyAppSettings> _myAppSettings;
        public LoginRepository(DBContext context, IOptions<MyAppSettings> myAppSettings)
        {
            _myAppSettings = myAppSettings;
            _context = context;
        }
        public UsuarioEntity Login(RequestLoginModel request)
        {
            var usuarioContext = new UsuarioContext(_myAppSettings);
            return usuarioContext.Select(request);
        }

        public void Insert(UsuarioEntity usuario)
        {
            _context.Usuario.Add(usuario);
            _context.SaveChanges();

            var usuariolEmail = new UsuarioEmailEntity(usuario.Id, usuario.Email);
            _context.UsuarioEmail.Add(usuariolEmail);
            _context.SaveChanges();

        }
    }
}
