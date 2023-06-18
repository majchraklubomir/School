using System;
using System.ComponentModel;
using System.Net.NetworkInformation;


namespace WindowsFormsApp2
{
    public class MAC_table_entry : INotifyPropertyChanged
    {
        public PhysicalAddress MAC { get; set; }
        public String port;
        public int timer;
        public MAC_table_entry(PhysicalAddress address, String port, int timer)
        {
            this.MAC = address;
            this.port = port;
            this.timer = timer;
        }

        public event PropertyChangedEventHandler PropertyChanged;

        private void NotifyPropertyChanged(string p)
        {
            lock (this)
            {
                if (PropertyChanged != null)
                    PropertyChanged.Invoke(this, new PropertyChangedEventArgs(p));
            }
            
        }

        public string Port
        {
            get { return port; }
            set
            {
                port = value;
                this.NotifyPropertyChanged("Port");
            }
        }
        public int Timer
        {
            get { return timer; }
            set
            {
                timer = value;
                this.NotifyPropertyChanged("Timer");
            }
        }
    }
}
