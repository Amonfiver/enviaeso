/**
 * Propósito:
 * Generar códigos simples y legibles para grupos de EnviaEso.
 *
 * Alcance:
 * MVP inicial para creación de grupos desde el panel del profesor.
 *
 * Decisiones:
 * - Formato: 3 letras + 5 números
 * - Fácil de leer y copiar en clase
 *
 * Limitaciones:
 * - No garantiza unicidad absoluta por sí solo
 * - La unicidad final la asegura la base de datos
 */

export function generarCodigoGrupo() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = '0123456789';

  let codigo = '';

  for (let i = 0; i < 3; i += 1) {
    codigo += letras[Math.floor(Math.random() * letras.length)];
  }

  for (let i = 0; i < 5; i += 1) {
    codigo += numeros[Math.floor(Math.random() * numeros.length)];
  }

  return codigo;
}