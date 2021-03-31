using BoatLux.Application.Interfaces;
using BoatLux.Domain.Entities;
using BoatLux.Domain.Entities.Financeiro;
using BoatLux.Domain.Interfaces;
using BoatLux.Infra.Mapping;
using BoatLux.Infra.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace BoatLux.Application.UseCases
{
    public class FinanceiroUseCase : IFinanceiroUseCase
    {
        private readonly IFinanceiroRepository _repository;
        
        public FinanceiroUseCase(IFinanceiroRepository repository)
        {
            _repository = repository;
        }        

        public List<CustoEntity> GetAllCustos()
        {
            var custos = _repository.GetAllCustos();
            return custos;
        }

        public void Insert(CustoEntity custo)
        {
            _repository.Insert(custo);
        }

        public void Update(CustoEntity custo)
        {
            _repository.Update(custo);
        }

        public void Delete(CustoEntity custo)
        {
            _repository.Delete(custo);
        }
    }
}
