using BoatLux.Domain.Entities.Financeiro;
using System;
using System.Collections.Generic;
using System.Text;

namespace BoatLux.Domain.Interfaces
{
    public interface IFinanceiroRepository
    {
        List<CustoEntity> GetAllCustos();
        void Update(CustoEntity custo);

        void Insert(CustoEntity custo);
        void Delete(CustoEntity custo);
    }
}
