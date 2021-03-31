using Boatlux.Domain.Models.Login;
using BoatLux.Application.Interfaces;
using BoatLux.Application.UseCases;
using BoatLux.Domain.Entities.Login;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace BoatLux.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly ILoginUseCase _useCase;

        public LoginController(ILoginUseCase useCase)
        {
            _useCase = useCase;
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("Auth")]
        public ActionResult<dynamic> Login([FromBody] RequestLoginModel request)
        {
            try
            {
                if (ModelState.IsValid)
                    return _useCase.Login(request);
                else
                    return NotFound(new { message = "Dados de login inválidos." });

            }
            catch(Exception ex)
            {
                return NotFound(new { message = $"Erro ao realizar login: {ex.Message}" });
            }
        }
        [HttpPost]
        [AllowAnonymous]
        [Route("Create")]
        public ActionResult<dynamic> Create([FromBody] UsuarioEntity usuario)
        {
            try
            {
                if (ModelState.IsValid)
                    return _useCase.Insert(usuario);
                else
                    return NotFound(new { message = "Dados de login inválidos." });

            }
            catch (Exception ex)
            {
                return NotFound(new { message = $"Erro ao realizar login: {ex.Message}" });
            }
        }
    }
}
