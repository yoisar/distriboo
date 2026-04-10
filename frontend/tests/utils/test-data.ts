export const testData = {
  superAdmin: {
    email: process.env.TEST_SUPER_ADMIN_EMAIL || 'sioy23@gmail.com',
    password: process.env.TEST_SUPER_ADMIN_PASSWORD || '12345678',
    role: 'super_admin',
  },

  revendedores: [
    {
      name: 'Juan Perez',
      email: 'juan@test.com',
      password: '12345678',
      porcentaje_base: 20,
      codigo_referido: 'JUAN2024',
    },
  ],

  planes: [
    { nombre: 'BASIC', slug: 'basic', precio: 60000, setup: 60000 },
    { nombre: 'PRO', slug: 'pro', precio: 90000, setup: 90000 },
    { nombre: 'FULL', slug: 'full', precio: 120000, setup: 120000 },
  ],

  descuentos: { 1: 0, 3: 10, 6: 20, 12: 30 } as Record<number, number>,

  distribuidores: [
    {
      nombre_comercial: 'Helados del Sur',
      email: 'admin@heladosdelsur.com',
      password: '12345678',
    },
  ],

  clientes: [
    {
      razon_social: 'Distribuidora Norte SRL',
      email: 'norte@demo.com',
      password: '12345678',
    },
  ],

  comisiones: {
    base: 20,
    bonus_nivel_1: 25,
    bonus_nivel_1_clientes: 3,
    bonus_nivel_2: 30,
    bonus_nivel_2_clientes: 5,
  },
};

export function calcularPrecioConDescuento(precioBase: number, plazo: number): number {
  const descuento = testData.descuentos[plazo] || 0;
  return precioBase * (1 - descuento / 100);
}

export function calcularComision(montoBase: number, clientesActivos: number): {
  porcentaje: number;
  monto: number;
} {
  let porcentaje = testData.comisiones.base;
  if (clientesActivos >= testData.comisiones.bonus_nivel_2_clientes) {
    porcentaje = testData.comisiones.bonus_nivel_2;
  } else if (clientesActivos >= testData.comisiones.bonus_nivel_1_clientes) {
    porcentaje = testData.comisiones.bonus_nivel_1;
  }
  return {
    porcentaje,
    monto: montoBase * (porcentaje / 100),
  };
}
