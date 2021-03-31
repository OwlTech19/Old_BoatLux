using BoatLux.Domain.Entities;
using BoatLux.Domain.Entities.Financeiro;
using System;
using System.Collections.Generic;
using System.Text;

namespace BoatLux.Domain.Interfaces
{
    public interface IBaseRepository<T> where T: BaseEntity
    {
        List<T> Select();
        void Insert();
    }
}
