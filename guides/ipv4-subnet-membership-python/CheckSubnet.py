import ipaddress as IpAddress
import sys as Sys
from pathlib import Path


def CheckSubnet(FileName, NetworkText):
    Network = IpAddress.IPv4Network(NetworkText, strict=True)
    with Path(FileName).open("rb") as Input:
        Data = Input.read(1048577)
    if len(Data) > 1048576:
        raise ValueError("input exceeds 1 MiB")
    Lines = Data.decode("utf-8-sig").splitlines()
    if len(Lines) > 1000:
        raise ValueError("more than 1000 input lines")
    Inside = 0
    Outside = 0
    Invalid = 0
    for Number, Line in enumerate(Lines, start=1):
        Text = Line.strip()
        try:
            Address = IpAddress.IPv4Address(Text)
        except ValueError:
            Invalid += 1
            print(f"Line {Number}: invalid IPv4 address")
            continue
        if Address in Network:
            Inside += 1
            print(f"Line {Number}: {Address} inside")
        else:
            Outside += 1
            print(f"Line {Number}: {Address} outside")
    print(f"Network: {Network}; inside: {Inside}; outside: {Outside}; invalid: {Invalid}")
    return 1 if Invalid else 0


def Main():
    if len(Sys.argv) != 3:
        print("Usage: python3 CheckSubnet.py addresses.txt NETWORK", file=Sys.stderr)
        return 2
    try:
        return CheckSubnet(Sys.argv[1], Sys.argv[2])
    except (OSError, UnicodeError, ValueError) as Error:
        print(f"Check stopped: {Error}", file=Sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(Main())
