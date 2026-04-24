/**
 * Cria um middleware que retorna 405 para métodos não permitidos em uma rota.
 * @param {string[]} allowed - Métodos HTTP permitidos (em maiúsculo)
 */
export function methodNotAllowed(allowed) {
  return (req, res) => {
    res.set('Allow', allowed.join(', '));
    res.status(405).json({ erro: 'Método não permitido.' });
  };
}
