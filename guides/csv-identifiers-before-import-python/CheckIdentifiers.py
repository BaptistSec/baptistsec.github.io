import csv as Csv
import io as Io
import json as Json
import sys as Sys
from pathlib import Path


def CheckIdentifiers(FileName, Columns):
    if len(Columns) != len(set(Columns)):
        raise ValueError("choose each column once")
    with Path(FileName).open("rb") as Input:
        Data = Input.read(1048577)
    if len(Data) > 1048576:
        raise ValueError("input exceeds 1 MiB")
    Csv.field_size_limit(65536)
    Reader = Csv.reader(Io.StringIO(Data.decode("utf-8-sig"), newline=""), strict=True)
    try:
        Header = next(Reader)
    except StopIteration:
        raise ValueError("empty input") from None
    if not Header or any(not Name.strip() for Name in Header):
        raise ValueError("blank header name")
    if len(Header) != len(set(Header)):
        raise ValueError("repeated header name")
    if any(Name not in Header for Name in Columns):
        raise ValueError("selected column not found")
    Indices = [Header.index(Name) for Name in Columns]
    Warnings = []
    Records = 0
    for Records, Row in enumerate(Reader, start=1):
        if Records > 1000:
            raise ValueError("more than 1000 data records")
        if len(Row) != len(Header):
            raise ValueError(f"record {Records} has wrong field count")
        for Index in Indices:
            Value = Row[Index]
            if not Value or any(Character not in "0123456789" for Character in Value):
                continue
            Risks = []
            if len(Value) > 1 and Value.startswith("0"):
                Risks.append("potential leading-zero conversion")
            if len(Value) > 15:
                Risks.append("potential numeric precision loss")
            if Risks:
                Warnings.append({"Record": Records, "EndingLine": Reader.line_num,
                                 "Column": Index + 1, "Risks": Risks})
    Report = {"RecordsChecked": Records,
              "SelectedColumns": [Index + 1 for Index in Indices],
              "FlaggedCells": len(Warnings), "Warnings": Warnings}
    print(Json.dumps(Report, indent=2, ensure_ascii=True))
    return 1 if Warnings else 0


def Main():
    if len(Sys.argv) < 3:
        print("Usage: python3 CheckIdentifiers.py input.csv COLUMN [COLUMN ...]", file=Sys.stderr)
        return 2
    try:
        return CheckIdentifiers(Sys.argv[1], Sys.argv[2:])
    except (OSError, UnicodeError, ValueError, Csv.Error) as Error:
        print(f"Check stopped: {Error}", file=Sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(Main())
