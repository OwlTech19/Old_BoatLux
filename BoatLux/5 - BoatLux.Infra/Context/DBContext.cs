using BoatLux.Domain.Entities.Financeiro;
using BoatLux.Domain.Entities.Login;
using BoatLux.Infra.Mapping.Financeiro;
using BoatLux.Infra.Mapping.Login;
using Microsoft.EntityFrameworkCore;

namespace BoatLux.Infra.Context
{
    public class DBContext : DbContext
    {
        public DBContext(DbContextOptions<DBContext> options) : base(options){        }

        public DbSet<CustoEntity> Custo { get; set; }
        public DbSet<UsuarioEntity> Usuario { get; set; }
        public DbSet<UsuarioEmailEntity> UsuarioEmail { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new CustoMap());
            modelBuilder.ApplyConfiguration(new UsuarioMap());
            modelBuilder.ApplyConfiguration(new UsuarioEmailMap());
        }
    }
}
