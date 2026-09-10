from scapy.all import ARP, Ether, srp
import sys

def scan_network(ip_range):
    """
    Scans the given IP range (e.g., '192.168.1.1/24') for active hosts.
    Returns a list of dictionaries with IP and MAC addresses.
    """
    print(f"Scanning network: {ip_range} ...")
    
    # Create ARP request packet
    arp = ARP(pdst=ip_range)
    # Broadcast Ethernet frame
    ether = Ether(dst="ff:ff:ff:ff:ff:ff")
    # Stack them
    packet = ether / arp
    
    # Send and receive packets (timeout=2 seconds, verbose off)
    result = srp(packet, timeout=3, verbose=0)[0]
    
    devices = []
    for sent, received in result:
        devices.append({'ip': received.psrc, 'mac': received.hwsrc})
    
    return devices

def main():
    if len(sys.argv) != 2:
        print("Usage: sudo python network_scanner.py <ip_range>")
        print("Example: sudo python network_scanner.py 192.168.1.1/24")
        sys.exit(1)
    
    ip_range = sys.argv[1]
    devices = scan_network(ip_range)
    
    print("\nActive devices found:")
    print("IP" + " " * 18 + "MAC Address")
    print("-" * 40)
    for device in devices:
        print(f"{device['ip']:20} {device['mac']}")
main()
