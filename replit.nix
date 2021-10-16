{ pkgs }: {
  deps = [
    pkgs.nodejs-16_x
    (pkgs.nodePackages_latest.pnpm.override {
      postInstall = "mkdir -p $out/bin && ln -s $out/lib/node_modules/pnpm/bin/pnpm.cjs $out/bin/pnpm";
    })
  ];
}
