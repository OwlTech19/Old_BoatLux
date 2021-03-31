using BoatLux.Domain.Entities.Financeiro;
using System;
using System.Collections.Generic;
using System.Text;

namespace BoatLux.Application.Interfaces
{
    public interface IFinanceiroUseCase
    {
        List<CustoEntity> GetAllCustos();
        void Insert(CustoEntity custo);
        void Update(CustoEntity custo);
        void Delete(CustoEntity custo);
    }
}
