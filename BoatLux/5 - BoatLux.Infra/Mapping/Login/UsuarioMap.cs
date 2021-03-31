using BoatLux.Domain.Entities.Login;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BoatLux.Infra.Mapping.Login
{
    public class UsuarioMap : IEntityTypeConfiguration<UsuarioEntity>
    {
        public void Configure(EntityTypeBuilder<UsuarioEntity> builder)
        {
            builder.ToTable("usuarios");
            builder.HasKey(x => x.Id).HasName("id");
            builder.Property(x => x.IdTipo).HasColumnName("id_tipo").HasColumnType("int(4)");
            builder.Property(x => x.IdFranqueado).HasColumnName("id_franqueado").HasColumnType("int(11)");
            builder.Property(x => x.ApelidoFranqueado).HasColumnName("apelido_franqueado").HasColumnType("varchar(45)");
            builder.Property(x => x.IdStatus).HasColumnName("id_status").HasColumnType("int(4)");
            builder.Property(x => x.Senha).HasColumnName("senha").HasColumnType("varchar(255)");
            builder.Property(x => x.DataCadastro).HasColumnName("data_cadastro").HasColumnType("datetime");
            builder.Property(x => x.Chave).HasColumnName("chave").HasColumnType("varchar(100)");
            builder.Property(x => x.Validade).HasColumnName("validade").HasColumnType("datetime");
            builder.Property(x => x.Referencia).HasColumnName("referencia").HasColumnType("varchar(45)");
        }
    }
}
