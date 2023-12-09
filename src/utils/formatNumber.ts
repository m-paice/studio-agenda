export function formatarTelefone(telefone: string) {
  // Remover caracteres não numéricos
  const numerosTelefone = telefone.replace(/\D/g, "");

  // Definir a máscara desejada
  const mascara = "(XX) XXXXX-XXXX";

  let telefoneFormatado = "";
  let indiceMascara = 0;

  // Iterar sobre os números do telefone e aplicar a máscara
  for (
    let i = 0;
    i < numerosTelefone.length && indiceMascara < mascara.length;
    i++
  ) {
    if (mascara[indiceMascara] === "X") {
      telefoneFormatado += numerosTelefone[i];
      indiceMascara++;
    } else {
      telefoneFormatado += mascara[indiceMascara];
      indiceMascara++;
      i--; // Para garantir que o próximo número seja analisado na próxima iteração
    }
  }

  return telefoneFormatado;
}
