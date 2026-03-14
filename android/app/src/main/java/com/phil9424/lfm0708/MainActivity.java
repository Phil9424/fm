package com.phil9424.lfm0708;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import net.hampoelz.capacitor.nodejs.NodeJSPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NodeJSPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
