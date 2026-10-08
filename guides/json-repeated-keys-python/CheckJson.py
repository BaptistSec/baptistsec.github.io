import json as Json
import sys as Sys
from pathlib import Path


def UniqueObject(Pairs):
    Result = {}
    for Key, Value in Pairs:
        if Key in Result:
            raise ValueError("repeated object key")
        Result[Key] = Value
    return Result


def RejectConstant(Value):
    raise ValueError("non-standard number constant")


def CheckJson(FileName):
    with Path(FileName).open("rb") as Input:
        Data = Input.read(65537)
    if len(Data) > 65536:
        raise ValueError("input exceeds 64 KiB")
    Text = Data.decode("utf-8-sig")
    Value = Json.loads(Text, object_pairs_hook=UniqueObject,
                       parse_constant=RejectConstant)
    Kind = "object" if isinstance(Value, dict) else "array" if isinstance(Value, list) else "scalar"
    print(f"JSON check passed; top-level value: {Kind}")
    return 0


def Main():
    if len(Sys.argv) != 2:
        print("Usage: python3 CheckJson.py input.json", file=Sys.stderr)
        return 2
    try:
        return CheckJson(Sys.argv[1])
    except (OSError, UnicodeError, ValueError, RecursionError) as Error:
        print(f"Check stopped: {Error}", file=Sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(Main())
