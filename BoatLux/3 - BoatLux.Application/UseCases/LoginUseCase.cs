using Boatlux.Domain.Models.Login;
using BoatLux.Application.Interfaces;
using BoatLux.Application.Services;
using BoatLux.Domain.Entities.Login;
using BoatLux.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace BoatLux.Application.UseCases
{
    public class LoginUseCase : ILoginUseCase
    {
        private readonly ILoginRepository _repository;
        private readonly ITokenService _tokenService;

        public LoginUseCase(ILoginRepository repository, ITokenService tokenService)
        {
            _repository = repository;
            _tokenService = tokenService;
        }
        public ResponseLoginModel Login(RequestLoginModel request)
        {
            var usuario = _repository.Login(request);

            var response = new ResponseLoginModel(usuario.Id, usuario.Email, usuario.Email, "", usuario.Senha);

            if (_tokenService.ValidPassword(request.Password, response.Password))
            {
                response.SetToken(_tokenService.GenerateToken(response));
            }
            return response;
        }

        public UsuarioEntity Insert(UsuarioEntity usuario)
        {
            var senha = _tokenService.CryptPassword(usuario.Senha);
            usuario.SetDataCadastro().SetSenha(senha);
            _repository.Insert(usuario);

            return usuario;
        } 

    }
}
