{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
  };

  outputs = { self, nixpkgs }: 
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {

    inherit (pkgs) node pnpm;

    devShells.${system}.default = pkgs.mkShell {
      buildInputs = with pkgs; [ nodejs nodePackages.pnpm lazygit ];
    };
  };
}
