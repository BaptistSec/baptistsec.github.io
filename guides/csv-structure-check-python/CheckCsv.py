import csv as Csv
import io as Io
import sys as Sys
from pathlib import Path


def CheckCsv(FileName):
    with Path(FileName).open("rb") as Input:
        Data = Input.read(1048577)
    if len(Data) > 1048576:
        raise ValueError("input exceeds 1 MiB")
    Text = Data.decode("utf-8-sig")
    Csv.field_size_limit(65536)
    Reader = Csv.reader(Io.StringIO(Text, newline=""), strict=True)
    try:
        Header = next(Reader)
    except StopIteration:
        raise ValueError("empty input") from None
    if not Header or any(not Name.strip() for Name in Header):
        raise ValueError("header contains a blank name")
    if len(Header) != len(set(Header)):
        raise ValueError("header contains repeated names")
    Good = 0
    Bad = 0
    for Number, Row in enumerate(Reader, start=1):
        if Number > 1000:
            raise ValueError("more than 1000 data records")
        if len(Row) != len(Header):
            Bad += 1
            print(f"Record {Number}, ending at line {Reader.line_num}: expected {len(Header)} fields, found {len(Row)}")
        else:
            Good += 1
    print(f"Columns: {len(Header)}; matching records: {Good}; mismatched records: {Bad}")
    return 1 if Bad else 0


def Main():
    if len(Sys.argv) != 2:
        print("Usage: python3 CheckCsv.py input.csv", file=Sys.stderr)
        return 2
    try:
        return CheckCsv(Sys.argv[1])
    except (OSError, UnicodeError, ValueError, Csv.Error) as Error:
        print(f"Check stopped: {Error}", file=Sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(Main())
