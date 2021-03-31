using BoatLux.Domain.Entities.Financeiro;
using BoatLux.Domain.Interfaces;
using BoatLux.Infra.Context;
using System;
using System.Collections.Generic;
using System.Text;

namespace BoatLux.Infra.Repositories
{
    public class FinanceiroRepository : IFinanceiroRepository
    {
        private readonly DBContext _context;
        public FinanceiroRepository(DBContext context) => _context = context;

        public List<CustoEntity> GetAllCustos()
        {
            var custos = new List<CustoEntity>();

            var dbCustos = _context.Custo;

            foreach (var custo in dbCustos)
                custos.Add(custo);

            return custos;
        }

        public void Update(CustoEntity custo)
        {
            _context.Custo.Update(custo);
            _context.SaveChanges();
        }

        public void Insert(CustoEntity custo)
        {
            _context.Custo.Add(custo);
            _context.SaveChanges();
        }

        public void Delete(CustoEntity custo)
        {
            _context.Custo.Remove(custo);
            _context.SaveChanges();
        }
    }
}
