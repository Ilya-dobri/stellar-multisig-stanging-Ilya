import { IBuildTxJSONSlice } from "@/shared/types/store/slices";
import { StateCreator } from "zustand";
import { IOperation, ISignature } from "@/shared/types/store/slices";
import { TX } from "@/shared/types/store/slices/buildTxJSONSlice";
import StellarSdk from "stellar-sdk";

type ImmerStateCreator<T> = StateCreator<T, [["zustand/immer", never]], [], T>;

export const buildTxJSONSlice: ImmerStateCreator<IBuildTxJSONSlice> = (set) => {
  const initialTx: TX = {
    tx: {
      source_account: "",
      fee: 0,
      seq_num: 0,
      cond: {
        time: {
          min_time: 0,
          max_time: 0,
        },
      },
      memo: "none",
      operations: [] as IOperation[],
      ext: "v0",
    },
    signatures: [] as ISignature[],
  };

  return {
    fullTransaction: { tx: initialTx },
    tx: initialTx,
    signatures: [] as ISignature[],
    setSourceAccount: (source_account: string) =>
      set((state) => {
        state.tx.tx.source_account = source_account;
        state.fullTransaction = { tx: state.tx, };
      }),
    setFee: (fee: number) =>
      set((state) => {
        state.tx.tx.fee = fee;
        state.fullTransaction = { tx: state.tx };
      }),
    setSeqNum: (seq_num: number | string) =>
      set((state) => {
        if (typeof seq_num === "string") {
          seq_num = parseInt(seq_num);
        }
        state.tx.tx.seq_num = seq_num;
        state.fullTransaction = { tx: state.tx };
      }),
    setTimeCondition: (min_time: number, max_time: number) =>
      set((state) => {
        state.tx.tx.cond.time.min_time = min_time;
        state.tx.tx.cond.time.max_time = max_time;
        state.fullTransaction = { tx: state.tx };
      }),
    setMemo: (
      memo:
        | "none"
        | { text?: string; id?: string; hash?: string; return?: string }
    ) =>
      set((state) => {
        state.tx.tx.memo = memo;
        state.fullTransaction = { tx: state.tx };
      }),
    setOperations: (operations: IOperation[]) =>
      set((state) => {
        state.tx.tx.operations = operations;
        state.fullTransaction = { tx: state.tx };
      }),
    addOperation: (operationType: "set_options" | "manage_data") =>
      set((state) => {
        const body: IOperation["body"] = {
          ...(operationType === "manage_data"
            ? {
                manage_data: {
                  data_name: "",
                  data_value: null,
                },
              }
            : {
                set_options: {
                  inflation_dest: null,
                  clear_flags: null,
                  set_flags: null,
                  master_weight: null,
                  low_threshold: null,
                  med_threshold: null,
                  high_threshold: null,
                  home_domain: null,
                  signer: null,
                },
              }),
        };
        state.tx.tx.operations.push({
          source_account: StellarSdk.StrKey.isValidEd25519PublicKey(
            state.tx.tx.source_account
          )
            ? state.tx.tx.source_account
            : null,
          body,
        });
        state.fullTransaction = { tx: state.tx };
      }),
    removeOperation: (index: number) =>
      set((state) => {
        state.tx.tx.operations.splice(index, 1);
        state.fullTransaction = { tx: state.tx };
      }),
      addSignature: (signature: ISignature) =>
        set((state) => {
          state.tx.signatures.push(signature);
          state.fullTransaction = { tx: state.tx };
        }),
    removeSignature: (index: number) =>
      set((state) => {
        state.tx.signatures.splice(index, 1);
        state.fullTransaction = { tx: state.tx };
      }),
    resetTx: () =>
      set(() => ({
        tx: initialTx,
        fullTransaction: { tx: initialTx },
        signatures: [],
      })),
  };
};
