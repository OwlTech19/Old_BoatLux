using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace BoatLux.Domain.Entities.Financeiro
{
    public class CustoEntity : BaseEntity
    {
        
        public override int Id { get; set; }
        
        public int IdTipoCusto { get; set; }
        public int Codigo { get; set; }
        public string Nome { get; set; }
        public int Status { get; set; }
    }
}
