var cx_d=160.000000, cy_d=120.000000, fx_d=224.501999, fy_d=230.494003, width_d=320, height_d=240;
var cx_rgb=320.000000, cy_rgb=240.000000, fx_rgb=587.452087, fy_rgb=600.674561, width_rgb=640, height_rgb=480;
var r11=0.999711, r12=0.001065, r13=-0.024007, r21=0.001455, r22=-0.999867, r23=0.016223, r31=0.023986, r32=0.016253, r33=0.999580, t1=0.026000, t2=-0.000508, t3=-0.000863;

function xorPixel(image_data, x, y, r, g, b) {
  index = (x + y * image_data.width) * 4;
  image_data.data[index+0] = r | image_data.data[index+0];
  image_data.data[index+1] = g | image_data.data[index+1];
  image_data.data[index+2] = b | image_data.data[index+2];
}

onmessage = function(evt) {
  var rgb_image = evt.data.rgbimage;
  var depth_image = evt.data.depthimage;
  var threshold = evt.data.threshold;

  console.log(rgb_image.width + ', ' + rgb_image.height);
  console.log(depth_image.width + ', ' + depth_image.height);

  for (var x_d = 0; x_d < depth_image.width; x_d++) {
    for (var y_d = 0; y_d < depth_image.height; y_d++) {
      var index_d = (x_d + y_d * depth_image.width) * 4;
      var r = depth_image.data[index_d];
      var g = depth_image.data[index_d + 1];
      var b = depth_image.data[index_d + 2];

      var d = (0.299 * r + 0.587 * g + 0.114 * b) << 4;
      if (d > 4000)
        continue;

      // The mapping algorithm is based on 
      // http://nicolas.burrus.name/index.php/Research/KinectCalibration
      
      var p3d_x = (x_d - cx_d) * d / fx_d;
      var p3d_y = (y_d - cy_d) * d / fy_d;
      var p3d_z = d;

      var p3d1_x = r11 * p3d_x + -1.0 * r12 * p3d_y + r13 * p3d_z + t1 * 1000.0;
      var p3d1_y = r21 * p3d_x + -1.0 * r22 * p3d_y + r23 * p3d_z + t2 * 1000.0;
      var p3d1_z = r31 * p3d_x + -1.0 * r32 * p3d_y + r33 * p3d_z + t3 * 1000.0;

      var x_rgb = p3d1_x * fx_rgb / p3d1_z + cx_rgb;
      var y_rgb = p3d1_y * fy_rgb / p3d1_z + cy_rgb;

      if (x_rgb < 0 || x_rgb > width_rgb || y_rgb < 0 || y_rgb > height_rgb)
        continue;

      var x_image = x_rgb * rgb_image.width / width_rgb;
      var y_image = y_rgb * rgb_image.height / height_rgb;
      var x_image = Math.floor(x_image);
      var y_image = Math.floor(y_image);

      if (x_image > rgb_image.width || y_image > rgb_image.height)
        continue;
      
      //var x_image = x_d * width_rgb / width_d;
      //var y_image = y_d * height_rgb / height_d;

      xorPixel(rgb_image, x_image, y_image, 0x00, 0xFF, 0x00);
    }
  }

  postMessage({uvimage: rgb_image});
}