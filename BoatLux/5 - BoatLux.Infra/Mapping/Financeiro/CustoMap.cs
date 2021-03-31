using BoatLux.Domain.Entities.Financeiro;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace BoatLux.Infra.Mapping.Financeiro
{
    public class CustoMap : IEntityTypeConfiguration<CustoEntity>
    {
        public void Configure(EntityTypeBuilder<CustoEntity> builder)
        {
            builder.ToTable("_financeiro_custos");
            builder.HasKey(x => x.Id).HasName("id");
            builder.Property(x => x.IdTipoCusto).HasColumnName("id_tipo_custo").HasColumnType("int(4)");
            builder.Property(x => x.Codigo).HasColumnName("codigo").HasColumnType("int(3)");
            builder.Property(x => x.Nome).HasColumnName("nome").HasColumnType("varchar(45)");
            builder.Property(x => x.Status).HasColumnName("status").HasColumnType("tinyint(2)");
        }
    }
}
