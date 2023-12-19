import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@coral-xyz/anchor";
import { TransferTokensSpl } from "../target/types/transfer_tokens_spl";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { Instructions } from "../target/types/instructions";

describe("transfer spl tokens", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Instructions as anchor.Program<Instructions>;

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TransferTokensSpl as anchor.Program<
    TransferTokensSpl
  >;

  const mintKeypair = new Keypair();

  const metadata = {
    name: "nicoindem",
    symbol: "NCM",
    uri:
      "https://raw.githubusercontent.com/NikodemMarek/rustchain-transfer-tokens-spl/main/token-metadata.json",
  };

  const payer = provider.wallet as anchor.Wallet;
  const senderTokenAddress = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    payer.publicKey,
  );

  const recipient = new Keypair();
  const recepientTokenAddress = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    recipient.publicKey,
  );

  it("create", async () => {
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    );

    await program.methods
      .createToken(metadata.name, metadata.symbol, metadata.uri)
      .accounts({
        payer: payer.publicKey,
        mintAccount: mintKeypair.publicKey,
        metadataAccount: metadataAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair])
      .rpc();
  });

  it("mint", async () => {
    const amount = new anchor.BN(10);

    const res = await program.methods
      .mintToken(amount)
      .accounts({
        mintAuthority: payer.publicKey,
        recepient: payer.publicKey,
        mintAccount: mintKeypair.publicKey,
        associatedTokenAccount: senderTokenAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(`minted(mint ${mintKeypair.publicKey}): ${res}`);
  });

  it("transfer", async () => {
    const amount = new anchor.BN(7);

    const res = await program.methods
      .transferTokens(amount)
      .accounts({
        sender: payer.publicKey,
        recipient: recipient.publicKey,
        mintAccount: mintKeypair.publicKey,
        senderTokenAccount: senderTokenAddress,
        recipientTokenAccount: recepientTokenAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(`transfered: ${res}`);
  });
});
