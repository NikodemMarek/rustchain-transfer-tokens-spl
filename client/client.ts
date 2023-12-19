import * as anchor from "@coral-xyz/anchor";
import type { Instructions } from "../target/types/instructions";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.Instructions as anchor.Program<Instructions>;

