using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using SharpPcap;
using SharpPcap.LibPcap;
using System.Threading;
using PacketDotNet;
using System.Collections;


namespace WindowsFormsApp2
{
    public partial class Switch : Form
    {
        BindingList<MAC_table_entry> mac_table;
        ArrayList duplicit = new ArrayList();
        int mac_timer = 60;
        LibPcapLiveDevice loopback1 = null;
        LibPcapLiveDevice loopback2 = null;
        // time before mac table will be cleared, simultaing unplugging cable
        int loop1_cable = 15;
        int loop2_cable = 15;

        public Switch()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            mac_table = new BindingList<MAC_table_entry>();
            MACTABLE.DataSource = mac_table;

            table.Rows.Add("port 1 in", 0, 0, 0, 0, 0, 0, 0);
            table.Rows.Add("port 1 out", 0, 0, 0, 0, 0, 0, 0);
            table.Rows.Add("port 2 in", 0, 0, 0, 0, 0, 0, 0);
            table.Rows.Add("port 2 out", 0, 0, 0, 0, 0, 0, 0);
            
            LibPcapLiveDeviceList devices = LibPcapLiveDeviceList.Instance;
            foreach (LibPcapLiveDevice device in devices)
            {
                var devInterface = device.Interface;
                var friendlyName = devInterface.FriendlyName;

                if (friendlyName == "LoopBack1")
                {
                    loopback1 = device;
                }
                if (friendlyName == "LoopBack2")
                {
                    loopback2 = device;
                }
            }
            var thread = new Thread(() =>
            {
                Sniffer(loopback1);
            });
            thread.Start();
            var thread1 = new Thread(() =>
            {
                Sniffer(loopback2);
            });
            thread1.Start();
        }

        private void Sniffer(LibPcapLiveDevice device)
        {
            device.OnPacketArrival += new PacketArrivalEventHandler(device_OnPacketArrival);
            int timeout = 1000;
            device.Open(mode: DeviceModes.Promiscuous , read_timeout: timeout);
            device.Capture();
        }

        private void packet_handlerIN(EthernetPacket packet, string modifier)
        {
            int port;
            if (modifier == "LoopBack1")
            {
                port = 0;
            }
            else 
            { 
                port = 2; 
            }
            lock (this)
            {
                table[1, port].Value = (int)(table[1, port].Value) + 1;
                if (packet.PayloadPacket is IPv4Packet)
                {
                    IPv4Packet packet1 = (IPv4Packet)packet.PayloadPacket;
                    table[2, port].Value = (int)(table[2, port].Value) + 1;
                    if (packet1.PayloadPacket is TcpPacket)
                    {
                        table[3, port].Value = (int)(table[3, port].Value) + 1;
                        TcpPacket packet2 = (TcpPacket)packet1.PayloadPacket;
                        if(packet2.DestinationPort.ToString().Equals("80"))
                        {
                            table[7, port].Value = (int)(table[7, port].Value) + 1;
                        }
                        else if (packet2.SourcePort.ToString().Equals("80"))
                        {
                            table[7, port].Value = (int)(table[7, port].Value) + 1;
                        }
                    }
                    if (packet1.PayloadPacket is UdpPacket)
                    {
                        table[4, port].Value = (int)(table[4, port].Value) + 1;
                    }
                    if (packet1.PayloadPacket is IcmpV4Packet)
                    {
                        table[5, port].Value = (int)(table[5, port].Value) + 1;
                    }
                }
                if (packet.PayloadPacket is ArpPacket)
                {
                    table[6, port].Value = (int)(table[6, port].Value) + 1;
                }
            }
        }

        private void packet_handlerOUT(EthernetPacket packet, string modifier)
        {
            int port;
            if (modifier == "LoopBack1")
            {
                port = 1;
            }
            else
            {
                port = 3;
            }
            lock (this)
            {
                table[1, port].Value = (int)(table[1, port].Value) + 1;
                if (packet.PayloadPacket is IPv4Packet)
                {
                    IPv4Packet packet1 = (IPv4Packet)packet.PayloadPacket;
                    table[2, port].Value = (int)(table[2, port].Value) + 1;
                    if (packet1.PayloadPacket is TcpPacket)
                    {
                        table[3, port].Value = (int)(table[3, port].Value) + 1;
                        TcpPacket packet2 = (TcpPacket)packet1.PayloadPacket;
                        if (packet2.DestinationPort.ToString().Equals("80"))
                        {
                            table[7, port].Value = (int)(table[7, port].Value) + 1;
                        }
                        else if (packet2.SourcePort.ToString().Equals("80"))
                        {
                            table[7, port].Value = (int)(table[7, port].Value) + 1;
                        }
                    }
                    if (packet1.PayloadPacket is UdpPacket)
                    {
                        table[4, port].Value = (int)(table[4, port].Value) + 1;
                    }
                    if (packet1.PayloadPacket is IcmpV4Packet)
                    {
                        table[5, port].Value = (int)(table[5, port].Value) + 1;
                    }
                }
                if (packet.PayloadPacket is ArpPacket)
                {
                    table[6, port].Value = (int)(table[6, port].Value) + 1;
                }
            }
        }

        private bool check_duplicate(Packet packet)
        {
            lock (this)
            {
                try
                {
                    duplicit.Add(packet.PrintHex().GetHashCode());
                    if (duplicit.Contains(packet.PrintHex().GetHashCode()))
                    {
                        return true;
                    }
                    return false;
                }
                catch
                {
                    return false;
                }
            }
        }

        private void device_OnPacketArrival(object sender, PacketCapture e)
        {
            var rawpacket = e.GetPacket();
            var packet = Packet.ParsePacket(rawpacket.LinkLayerType, rawpacket.Data);
            LibPcapLiveDevice dev = (LibPcapLiveDevice)e.Device;
            string port_name = dev.Interface.FriendlyName;
            string send_to_port;
            if (loopback1.Interface.FriendlyName.Equals(port_name))
            {
                send_to_port = loopback2.Interface.FriendlyName;
                loop1_cable = 8;
            }
            else if(loopback2.Interface.FriendlyName.Equals(port_name))
            {
                send_to_port = loopback1.Interface.FriendlyName;
                loop2_cable = 8;
            }
            else
            {
                send_to_port = null;
            }
            if (packet is EthernetPacket)
            {
                if (check_duplicate(packet) == false)
                {
                    EthernetPacket ethpacket = (EthernetPacket)packet;
                    var block = ethpacket.SourceHardwareAddress.ToString();
                    // used to filter infinite ping to simulate unplugging cable
                    if (block.Equals("02004C4F4F50"))
                    {
                        return;
                    }
                    if (block.Equals("005079666805") || block.Equals("005079666803"))
                    {
                        //send_packet(ethpacket, send_to_port);
                        return;
                        
                    }
                
                    packet_handlerIN(ethpacket, port_name);
                    var src_MAC = ethpacket.SourceHardwareAddress;
                    var dst_MAC = ethpacket.DestinationHardwareAddress;
                    var entry = new MAC_table_entry(src_MAC, port_name, mac_timer);
                    var insert = 1;
                    var str = "FFFFFFFFFFFF";
                    if (!dst_MAC.ToString().Equals(str))
                    {
                        lock (this)
                        {
                            for (int i = 0; i < mac_table.Count; i++)
                            {
                                if (mac_table[i].MAC.Equals(entry.MAC))
                                {
                                    insert = 0;
                                    if (!mac_table[i].Port.Equals(entry.Port))
                                    {
                                        mac_table[i].Port = port_name;
                                    }
                                    mac_table[i].Timer = mac_timer;
                                }
                                if (mac_table[i].MAC.Equals(dst_MAC))
                                {
                                    send_to_port = mac_table[i].Port;
                                }
                            }
                        }
                        if (insert == 1)
                        {
                            try
                            {
                                mac_table.Add(entry);
                            }
                            catch (Exception eeeeee)
                            {

                            }
                        }
                    }
                    
                    
                    if(!send_to_port.Equals(port_name))
                    {
                        send_packet(ethpacket, send_to_port);
                    }
                }
            }
        }
        
        private void send_packet(EthernetPacket ethpacket, string port)
        {
            if (port == loopback1.Interface.FriendlyName)
            {
                loopback1.SendPacket(ethpacket);
                packet_handlerOUT(ethpacket, port);
            }
            else if(port == loopback2.Interface.FriendlyName)
            {
                loopback2.SendPacket(ethpacket);
                packet_handlerOUT(ethpacket, port);
            }
        }
        
        private void tableLayoutPanel1_Paint(object sender, PaintEventArgs e)
        {

        }

        private void dataGridView1_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {

        }

        private void dataGridView1_CellContentClick_1(object sender, DataGridViewCellEventArgs e)
        {

        }

        private void timer1_Tick(object sender, EventArgs e)
        {
            lock (this)
            {
                foreach (var i in mac_table.ToList())
                {
                    i.Timer = i.Timer - 1;
                    if(i.Timer == 0)
                    {
                        mac_table.Remove(i);
                    }
                }
                MACTABLE.Invoke((MethodInvoker)delegate () { MACTABLE.Invalidate(); });
                loop1_cable = loop1_cable - 1;
                loop2_cable = loop2_cable - 1;
                if(loop1_cable < 1)
                {
                    foreach (var i in mac_table.ToList())
                    {
                        if (i.Port.Equals("LoopBack1"))
                        {
                            mac_table.Remove(i);
                        }
                    }
                }
                if (loop2_cable < 1)
                {
                    foreach (var i in mac_table.ToList())
                    {
                        if (i.Port.Equals("LoopBack2"))
                        {
                            mac_table.Remove(i);
                        }
                    }
                }
            }
            

        }

        private void button1_Click(object sender, EventArgs e)
        {
            //MAC
            lock (this)
            {
                mac_table.Clear();
            }

        }

        private void button2_Click(object sender, EventArgs e)
        {
            //Statistics
            lock (this)
            {
                for (var i = 0; i < 4; i++)
                {
                    table[1, i].Value = 0;
                    table[2, i].Value = 0;
                    table[3, i].Value = 0;
                    table[4, i].Value = 0;
                    table[5, i].Value = 0;
                    table[6, i].Value = 0;
                    table[7, i].Value = 0;
                }
            }
        }

        private void button1_Click_1(object sender, EventArgs e)
        {
            int x;
            if (Int32.TryParse(textBox1.Text, out x))
            {
                mac_timer = x;
            }
        }

        private void textBox1_TextChanged(object sender, EventArgs e)
        {

        }

        private void listView1_SelectedIndexChanged(object sender, EventArgs e)
        {

        }
    }
}
