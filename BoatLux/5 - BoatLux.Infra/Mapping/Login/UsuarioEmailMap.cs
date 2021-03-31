using BoatLux.Domain.Entities.Login;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BoatLux.Infra.Mapping.Login
{
    public class UsuarioEmailMap : IEntityTypeConfiguration<UsuarioEmailEntity>
    {
        public void Configure(EntityTypeBuilder<UsuarioEmailEntity> builder)
        {
            builder.ToTable("usuarios_emails");
            builder.HasKey(x => x.Id).HasName("id");
            builder.Property(x => x.IdUsuario).HasColumnName("id_usuario").HasColumnType("int(11)");
            builder.Property(x => x.Email).HasColumnName("email").HasColumnType("varchar(200)");
        }
    }
}
