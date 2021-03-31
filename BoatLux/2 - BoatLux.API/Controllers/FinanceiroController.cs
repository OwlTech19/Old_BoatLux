using BoatLux.Application.Interfaces;
using BoatLux.Domain.Entities.Financeiro;
using BoatLux.Domain.Interfaces;
using BoatLux.Infra.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BoatLux.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FinanceiroController : ControllerBase
    {
        private readonly IFinanceiroUseCase _useCase;

        public FinanceiroController(IFinanceiroUseCase useCase)
        {
            _useCase = useCase;
        }

        [HttpGet]
        [Route("custo")]
        public List<CustoEntity> GetAllCentroCustos()
        {
            return _useCase.GetAllCustos();
        }

        [HttpPost]
        [Route("custo")]
        public ActionResult<dynamic> Insert([FromBody] CustoEntity custo)
        {
            if (ModelState.IsValid)
            {
                _useCase.Insert(custo);
                return "Ok";
            }
            return NotFound(new { message = $"Erro ao realizar inserção." });
        }

        [HttpPut]
        [Route("custo")]
        public ActionResult<dynamic> Update([FromBody] CustoEntity custo)
        {
            if (ModelState.IsValid)
            {
                _useCase.Update(custo);
                return "Ok";
            }
            return NotFound(new { message = $"Erro ao realizar inserção." });
        }

        [HttpDelete]
        [Route("custo")]
        public ActionResult<dynamic> Delete([FromBody] CustoEntity custo)
        {
            if (ModelState.IsValid)
            {
                _useCase.Delete(custo);
                return "Ok";
            }
            return NotFound(new { message = $"Erro ao realizar inserção." });
        }
    }
}
