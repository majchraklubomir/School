namespace WindowsFormsApp2
{
    partial class Switch
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.table = new System.Windows.Forms.DataGridView();
            this.names = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.eth = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.ip = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.tcp = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.udp = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.icmp = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.arp = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.http = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.MACTABLE = new System.Windows.Forms.DataGridView();
            this.mACDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.portDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.timerDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.mACtableentryBindingSource = new System.Windows.Forms.BindingSource(this.components);
            this.timer1 = new System.Windows.Forms.Timer(this.components);
            this.backgroundWorker1 = new System.ComponentModel.BackgroundWorker();
            this.button_MAC = new System.Windows.Forms.Button();
            this.button_statistics = new System.Windows.Forms.Button();
            this.button1 = new System.Windows.Forms.Button();
            this.textBox1 = new System.Windows.Forms.TextBox();
            ((System.ComponentModel.ISupportInitialize)(this.table)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.MACTABLE)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.mACtableentryBindingSource)).BeginInit();
            this.SuspendLayout();
            // 
            // table
            // 
            this.table.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.table.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.names,
            this.eth,
            this.ip,
            this.tcp,
            this.udp,
            this.icmp,
            this.arp,
            this.http});
            this.table.Location = new System.Drawing.Point(10, 11);
            this.table.Name = "table";
            this.table.RowHeadersWidth = 51;
            this.table.Size = new System.Drawing.Size(1133, 191);
            this.table.TabIndex = 70;
            this.table.CellContentClick += new System.Windows.Forms.DataGridViewCellEventHandler(this.dataGridView1_CellContentClick);
            // 
            // names
            // 
            this.names.HeaderText = "Ports";
            this.names.MinimumWidth = 6;
            this.names.Name = "names";
            this.names.ReadOnly = true;
            this.names.Width = 125;
            // 
            // eth
            // 
            this.eth.HeaderText = "Ethernet II";
            this.eth.MinimumWidth = 6;
            this.eth.Name = "eth";
            this.eth.ReadOnly = true;
            this.eth.Width = 125;
            // 
            // ip
            // 
            this.ip.HeaderText = "IP";
            this.ip.MinimumWidth = 6;
            this.ip.Name = "ip";
            this.ip.ReadOnly = true;
            this.ip.Width = 125;
            // 
            // tcp
            // 
            this.tcp.HeaderText = "TCP";
            this.tcp.MinimumWidth = 6;
            this.tcp.Name = "tcp";
            this.tcp.ReadOnly = true;
            this.tcp.Width = 125;
            // 
            // udp
            // 
            this.udp.HeaderText = "UDP";
            this.udp.MinimumWidth = 6;
            this.udp.Name = "udp";
            this.udp.ReadOnly = true;
            this.udp.Width = 125;
            // 
            // icmp
            // 
            this.icmp.HeaderText = "ICMP";
            this.icmp.MinimumWidth = 6;
            this.icmp.Name = "icmp";
            this.icmp.ReadOnly = true;
            this.icmp.Width = 125;
            // 
            // arp
            // 
            this.arp.HeaderText = "ARP";
            this.arp.MinimumWidth = 6;
            this.arp.Name = "arp";
            this.arp.ReadOnly = true;
            this.arp.Width = 125;
            // 
            // http
            // 
            this.http.HeaderText = "HTTP";
            this.http.MinimumWidth = 6;
            this.http.Name = "http";
            this.http.ReadOnly = true;
            this.http.Width = 125;
            // 
            // MACTABLE
            // 
            this.MACTABLE.AutoGenerateColumns = false;
            this.MACTABLE.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.MACTABLE.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.mACDataGridViewTextBoxColumn,
            this.portDataGridViewTextBoxColumn,
            this.timerDataGridViewTextBoxColumn});
            this.MACTABLE.DataSource = this.mACtableentryBindingSource;
            this.MACTABLE.Location = new System.Drawing.Point(10, 221);
            this.MACTABLE.Margin = new System.Windows.Forms.Padding(2, 2, 2, 2);
            this.MACTABLE.Name = "MACTABLE";
            this.MACTABLE.RowHeadersWidth = 51;
            this.MACTABLE.RowTemplate.Height = 24;
            this.MACTABLE.Size = new System.Drawing.Size(617, 191);
            this.MACTABLE.TabIndex = 71;
            this.MACTABLE.CellContentClick += new System.Windows.Forms.DataGridViewCellEventHandler(this.dataGridView1_CellContentClick_1);
            // 
            // mACDataGridViewTextBoxColumn
            // 
            this.mACDataGridViewTextBoxColumn.DataPropertyName = "MAC";
            this.mACDataGridViewTextBoxColumn.HeaderText = "MAC";
            this.mACDataGridViewTextBoxColumn.MinimumWidth = 6;
            this.mACDataGridViewTextBoxColumn.Name = "mACDataGridViewTextBoxColumn";
            this.mACDataGridViewTextBoxColumn.Width = 125;
            // 
            // portDataGridViewTextBoxColumn
            // 
            this.portDataGridViewTextBoxColumn.DataPropertyName = "Port";
            this.portDataGridViewTextBoxColumn.HeaderText = "Port";
            this.portDataGridViewTextBoxColumn.MinimumWidth = 6;
            this.portDataGridViewTextBoxColumn.Name = "portDataGridViewTextBoxColumn";
            this.portDataGridViewTextBoxColumn.Width = 125;
            // 
            // timerDataGridViewTextBoxColumn
            // 
            this.timerDataGridViewTextBoxColumn.DataPropertyName = "Timer";
            this.timerDataGridViewTextBoxColumn.HeaderText = "Timer";
            this.timerDataGridViewTextBoxColumn.MinimumWidth = 6;
            this.timerDataGridViewTextBoxColumn.Name = "timerDataGridViewTextBoxColumn";
            this.timerDataGridViewTextBoxColumn.Width = 125;
            // 
            // mACtableentryBindingSource
            // 
            this.mACtableentryBindingSource.DataSource = typeof(WindowsFormsApp2.MAC_table_entry);
            // 
            // timer1
            // 
            this.timer1.Enabled = true;
            this.timer1.Interval = 1000;
            this.timer1.Tick += new System.EventHandler(this.timer1_Tick);
            // 
            // button_MAC
            // 
            this.button_MAC.Location = new System.Drawing.Point(552, 221);
            this.button_MAC.Name = "button_MAC";
            this.button_MAC.Size = new System.Drawing.Size(75, 23);
            this.button_MAC.TabIndex = 72;
            this.button_MAC.Text = "Clear MAC";
            this.button_MAC.UseVisualStyleBackColor = true;
            this.button_MAC.Click += new System.EventHandler(this.button1_Click);
            // 
            // button_statistics
            // 
            this.button_statistics.Location = new System.Drawing.Point(1043, 179);
            this.button_statistics.Name = "button_statistics";
            this.button_statistics.Size = new System.Drawing.Size(100, 23);
            this.button_statistics.TabIndex = 73;
            this.button_statistics.Text = "Clear statistics";
            this.button_statistics.UseVisualStyleBackColor = true;
            this.button_statistics.Click += new System.EventHandler(this.button2_Click);
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(571, 288);
            this.button1.Margin = new System.Windows.Forms.Padding(2, 2, 2, 2);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(56, 19);
            this.button1.TabIndex = 74;
            this.button1.Text = "Set timer";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click_1);
            // 
            // textBox1
            // 
            this.textBox1.Location = new System.Drawing.Point(491, 288);
            this.textBox1.Margin = new System.Windows.Forms.Padding(2, 2, 2, 2);
            this.textBox1.Name = "textBox1";
            this.textBox1.Size = new System.Drawing.Size(76, 20);
            this.textBox1.TabIndex = 75;
            this.textBox1.Text = "60";
            this.textBox1.TextChanged += new System.EventHandler(this.textBox1_TextChanged);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(64)))), ((int)(((byte)(64)))), ((int)(((byte)(64)))));
            this.ClientSize = new System.Drawing.Size(1155, 687);
            this.Controls.Add(this.textBox1);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.button_statistics);
            this.Controls.Add(this.button_MAC);
            this.Controls.Add(this.MACTABLE);
            this.Controls.Add(this.table);
            this.Name = "Form1";
            this.Text = "Form1";
            this.Load += new System.EventHandler(this.Form1_Load);
            ((System.ComponentModel.ISupportInitialize)(this.table)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.MACTABLE)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.mACtableentryBindingSource)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.DataGridView table;
        private System.Windows.Forms.DataGridViewTextBoxColumn names;
        private System.Windows.Forms.DataGridViewTextBoxColumn eth;
        private System.Windows.Forms.DataGridViewTextBoxColumn ip;
        private System.Windows.Forms.DataGridViewTextBoxColumn tcp;
        private System.Windows.Forms.DataGridViewTextBoxColumn udp;
        private System.Windows.Forms.DataGridViewTextBoxColumn icmp;
        private System.Windows.Forms.DataGridViewTextBoxColumn arp;
        private System.Windows.Forms.DataGridViewTextBoxColumn http;
        private System.Windows.Forms.DataGridView MACTABLE;
        private System.Windows.Forms.Timer timer1;
        private System.ComponentModel.BackgroundWorker backgroundWorker1;
        private System.Windows.Forms.Button button_MAC;
        private System.Windows.Forms.Button button_statistics;
        private System.Windows.Forms.DataGridViewTextBoxColumn mACDataGridViewTextBoxColumn;
        private System.Windows.Forms.DataGridViewTextBoxColumn portDataGridViewTextBoxColumn;
        private System.Windows.Forms.DataGridViewTextBoxColumn timerDataGridViewTextBoxColumn;
        private System.Windows.Forms.BindingSource mACtableentryBindingSource;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.TextBox textBox1;
    }
}

