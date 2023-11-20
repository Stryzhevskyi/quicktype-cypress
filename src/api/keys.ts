export const pokemonKeys: Record<string, (...args: any[]) => any[]> = {
    berry: (id) => ['berry', id],
    berryFirmness: (id) => ['berry-firmness', id],
    berryFlavor: (id) => ['berry-flavor', id],
    contestType: (id) => ['contest-type', id],
    contestEffect: (id) => ['contest-effect', id],
    pokemons: () => ['pokemon'],
    pokemon: (id) => ['pokemon', id],
}
