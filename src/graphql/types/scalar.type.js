import gql from "graphql-tag";

export const scalar = gql`
  # Bytes32 is a 32 byte binary string, represented as 0x-prefixed hexadecimal.
  scalar Bytes32
  # Address is a 20 byte Ethereum address, represented as 0x-prefixed hexadecimal.
  scalar Address
  # Bytes is an arbitrary length binary string, represented as 0x-prefixed hexadecimal.
  # An empty byte string is represented as '0x'. Byte strings must have an even number of hexadecimal nybbles.
  scalar Bytes
  # BigInt is a large integer. Input is accepted as either a JSON number or as a string.
  # Strings may be either decimal or 0x-prefixed hexadecimal. Output values are all
  # 0x-prefixed hexadecimal.
  scalar BigInt
  # Long is a 64 bit unsigned integer.
  scalar Long
`;
