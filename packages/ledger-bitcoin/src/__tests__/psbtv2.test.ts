import { PsbtV2 } from "../psbtv2";

describe("PsbtV2", () => {
  it("deserializes a psbtV2 and reserializes it unchanged", async () => {
    const psbtBuf = Buffer.from(
      "cHNidP8BAAoBAAAAAAAAAAAAAQIEAgAAAAEDBAAAAAABBAECAQUBAgH7BAIAAAAAAQBxAgAAAAGTarLgEHL3k8/kyXdU3hth/gPn22U2yLLyHdC1dCxIRQEAAAAA/v///wLe4ccAAAAAABYAFOt418QL8QY7Dj/OKcNWW2ichVmrECcAAAAAAAAWABQjGNZvhP71xIdfkzsDjcY4MfjaE/mXHgABAR8QJwAAAAAAABYAFCMY1m+E/vXEh1+TOwONxjgx+NoTIgYDRV7nztyXsLpDW4AGb8ksljo0xgAxeYHRNTMMTuQ6x6MY9azC/VQAAIABAACAAAAAgAAAAAABAAAAAQ4gniz+J/Cth7eKI31ddAXUowZmyjYdWFpGew3+QiYrTbQBDwQBAAAAARAE/f///wESBAAAAAAAAQBxAQAAAAEORx706Sway1HvyGYPjT9pk26pybK/9y/5vIHFHvz0ZAEAAAAAAAAAAAJgrgoAAAAAABYAFDXG4N1tPISxa6iF3Kc6yGPQtZPsrwYyAAAAAAAWABTcKG4M0ua9N86+nsNJ+18IkFZy/AAAAAABAR9grgoAAAAAABYAFDXG4N1tPISxa6iF3Kc6yGPQtZPsIgYCcbW3ea2HCDhYd5e89vDHrsWr52pwnXJPSNLibPh08KAY9azC/VQAAIABAACAAAAAgAEAAAAAAAAAAQ4gr7+uBlkPdB/xr1m2rEYRJjNqTEqC21U99v76tzesM/MBDwQAAAAAARAE/f///wESBAAAAAAAIgICKexHcnEx7SWIogxG7amrt9qm9J/VC6/nC5xappYcTswY9azC/VQAAIABAACAAAAAgAEAAAAKAAAAAQMIqDoGAAAAAAABBBYAFOs4+puBKPgfJule2wxf+uqDaQ/kAAEDCOCTBAAAAAAAAQQiACA/qWbJ3c3C/ZbkpeG8dlufr2zos+tPEQSq1r33cyTlvgA=",
      "base64"
    );

    const psbt = new PsbtV2();
    psbt.deserialize(psbtBuf);

    expect(psbt.serialize()).toEqual(psbtBuf);
  });

  it("deserializes a psbtV0 and reserializes it as a valid psbtV2", async () => {
    const psbtV0 = Buffer.from(
      "cHNidP8BAFICAAAAAR/BzFdxy4OGDMVtlLz+2ThgjBf2NmJDW0HpxE/8/TFCAQAAAAD9////ATkFAAAAAAAAFgAUqo7zdMr638p2kC3bXPYcYLv9nYUAAAAAAAEBK0wGAAAAAAAAIlEg/AoQ0wjH5BtLvDZC+P2KwomFOxznVaDG0NSV8D2fLaQBAwQBAAAAIhXBUBcQi+zqje3FMAuyI4azqzA2esJi+c5eWDJuuD46IvUjIGsW6MH5efpMwPBbajAK//+UFFm28g3nfeVbAWDvjkysrMAhFlAXEIvs6o3txTALsiOGs6swNnrCYvnOXlgybrg+OiL1HQB2IjpuMAAAgAEAAIAAAACAAgAAgAAAAAAAAAAAIRZrFujB+Xn6TMDwW2owCv//lBRZtvIN533lWwFg745MrD0BCS7aAzYX4hDuf30ON4pASuocSLVqoQMCK+z3dG5HAKT1rML9MAAAgAEAAIAAAACAAgAAgAAAAAAAAAAAARcgUBcQi+zqje3FMAuyI4azqzA2esJi+c5eWDJuuD46IvUBGCAJLtoDNhfiEO5/fQ43ikBK6hxItWqhAwIr7Pd0bkcApAAA",
      "base64"
    );

    // the same psbt converted to V2, with keys sorted in lexicographical order
    const psbtV2 = Buffer.from(
      "cHNidP8BAgQCAAAAAQMEAAAAAAEEAQEBBQEBAfsEAgAAAAABAStMBgAAAAAAACJRIPwKENMIx+QbS7w2Qvj9isKJhTsc51WgxtDUlfA9ny2kAQMEAQAAAAEOIB/BzFdxy4OGDMVtlLz+2ThgjBf2NmJDW0HpxE/8/TFCAQ8EAQAAAAEQBP3///8iFcFQFxCL7OqN7cUwC7IjhrOrMDZ6wmL5zl5YMm64Pjoi9SMgaxbowfl5+kzA8FtqMAr//5QUWbbyDed95VsBYO+OTKyswCEWUBcQi+zqje3FMAuyI4azqzA2esJi+c5eWDJuuD46IvUdAHYiOm4wAACAAQAAgAAAAIACAACAAAAAAAAAAAAhFmsW6MH5efpMwPBbajAK//+UFFm28g3nfeVbAWDvjkysPQEJLtoDNhfiEO5/fQ43ikBK6hxItWqhAwIr7Pd0bkcApPWswv0wAACAAQAAgAAAAIACAACAAAAAAAAAAAABFyBQFxCL7OqN7cUwC7IjhrOrMDZ6wmL5zl5YMm64Pjoi9QEYIAku2gM2F+IQ7n99DjeKQErqHEi1aqEDAivs93RuRwCkAAEDCDkFAAAAAAAAAQQWABSqjvN0yvrfynaQLdtc9hxgu/2dhQA=",
      "base64"
    );

    const psbt = new PsbtV2();
    psbt.deserialize(psbtV0);

    expect(psbt.serialize()).toEqual(psbtV2);
  });
});
