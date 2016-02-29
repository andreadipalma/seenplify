## Copyright (C) 2015 dev
##
## This program is free software; you can redistribute it and/or modify it
## under the terms of the GNU General Public License as published by
## the Free Software Foundation; either version 3 of the License, or
## (at your option) any later version.
##
## This program is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
## GNU General Public License for more details.
##
## You should have received a copy of the GNU General Public License
## along with this program.  If not, see <http://www.gnu.org/licenses/>.

## -*- texinfo -*-
## @deftypefn {Function File} {@var{retval} =} estimateGravity (@var{x})
##
## @seealso{}
## @end deftypefn

## Author: dev <dev@devs-Mac.local>
## Created: 2015-03-22

function retval = lowpass (data, samprate, cutoff)
  # construct signal and plot in the time domain
  [B,A] = butter(2,cutoff/(samprate/2));
  retval = filtfilt(B,A,data);
endfunction

function retval = highpass (data, samprate, cutoff)
  # construct signal and plot in the time domain
  [B,A] = butter(2,cutoff/(samprate/2),"high");
  retval = filtfilt(B,A,data);
endfunction

function formattedDate = formatTime (timestamp)

        % create a new javascript Date object based on the timestamp
        % multiplied by 1000 so that the argument is in milliseconds, not seconds
        date = localtime(timestamp);

        % will display time in 10:30:23 format
        %formattedDate = strftime ("%r %A %e %B %Y", date);
        formattedDate = strftime ("%T", date);
endfunction;

function formattedDate = writeToFile (timestampLabel, series, config)

  % Save prepared data
  fileID = fopen([config.outputPath, '/vh_', timestampLabel, '.csv'],'w');

  fprintf(fileID, "V, H \n");

  for i=1:size(series, 1)
  %keyboard;
   fprintf(fileID, '%5f,', series(i, 1));
   fprintf(fileID, '%5f', series(i, 2));
   fprintf(fileID, '\n');
  end;
  fclose(fileID);
endfunction;


%   zero crossing rate
%   Works for vector and matrix
%   the function is vectorize, very fast
%   if x is a Vector returns the zero crossing rate of the vector
%   Ex:  x = [1 2 -3 4 5 -6 -2 -6 2];
%        y = ZCR(x) -> y = 0.444
%   if x is a matrix returns a row vector with the zero crossing rate of
%   the columns values
%   By:
function y = ZCR(x)
y = sum(abs(diff(x>0)))/length(x);
end

function s = temporalSkewness(d,p,c,sp)
s = sum((p-c).^3.*d) ./ sum(d) ./ sp.^3;
end;

function k = temporalKurtosis(d,p,c,s)
k = sum((p-c).^4.*d) ./ sum(d) ./ s.^4;
end;

function [Y, f] = spectrum(FrameSignal, freq1, num_tsteps, num_periods)
    v = FrameSignal .* hann(length(FrameSignal));
    N = length(v);
    Y = abs(fft(v, N));

    period1 = 1 / freq1;
    w1 = 2 * pi * freq1;
    tstep = num_periods * period1 / num_tsteps;

    f_s = num_tsteps / (period1*num_periods);
    f = f_s*(0:N-1)/N;

endfunction;

function [X_norm, mu, sigma] = featureNormalize(X)

  mu = mean(X);
  sigma = std(X);
  m = size(X, 1);
  X_norm = (X - repmat(mu, m, 1)) / diag(sigma);

end

function [X_norm, mu, sigma] = featureNormalize2(X)
  X_norm = X;
  mu = zeros(1, size(X, 2));
  sigma = zeros(1, size(X, 2));

  mu    = mean(X);
  sigma = std(X);

  indicies = 1:size(X, 2);

  for i = indicies;
    XminusMu  = X(:, i) - mu(i);
    X_norm(:, i) = XminusMu / sigma(i);
  end
endfunction;

function c = centroid(d,p)
    c = sum(p * abs(d)) ./ sum(abs(d));
endfunction;

function Sf = spread(d,p,c)
    Sf = sqrt(sum((p - c').^2 * abs(d))./ sum(abs(d)));
endfunction;

function Sk = skewness(d, p, c, Sf)
    Sk = sum(((p - c').^3)*abs(d)) ./ sum(abs(d)) ./ (Sf.^(3));
endfunction;

function Sk = kurtosis(d,p, c, Sf)
    Sk = sum(((p - c').^4)*abs(d)) ./ sum(abs(d)) ./ (Sf.^(4));
endfunction;

function p = powerSpectrum(t, X)
   % N = 8; %% number of points
   N = length(t);
   p = abs(X)/(N/2); %% absolute value of the fft
   p = p(1:N/2).^2; %% take the positve frequency half, only
endfunction;

function retval = spectralEntropy(Y)
    % Compute the Power Spectrum
    N = length(Y);
    sqrtPyy = ((sqrt(abs(Y).*abs(Y)) * 2 )/N);
    sqrtPyy = sqrtPyy(1:end/2);

    %Normalization
    d=sqrtPyy(:);
    d=d/sum(d+ 1e-12);

    %Entropy Calculation
    logd = log2(d + 1e-12);
    Entropy = -sum(d.*logd)/log2(length(d));
    if ((~isfinite(Entropy)) || (isnan(Entropy)))
      fprintf("WARNING: N=%d\n", N);
      Entropy = 0;
    endif;
    retval = Entropy;

endfunction;



function retval = calculateFeatures(config, featureConfig)
  % Load Training Data
  printf('**** Start processing file data ****\n');

  % Reading raw data files in the source directory
  if (isdir (config.dataPath) == false)
    printf('!!!!ERROR: %s is not a directory\n', config.dataPath);
    close;
  endif

  [rawFiles, err, msg] = readdir (config.dataPath);

  if (err != 0)
    printf('!!!!ERROR: %s \n', msg);
    close;
  endif

  printf('>>>> Found %d files in the directory', numel(rawFiles));
  for ind = 1:numel(rawFiles)
    ## skip special files . and ..
    if ((regexp (rawFiles{ind}, "^\\.\\.?$")) || (length(regexp (rawFiles{ind}, ".csv$")) == 0))
      printf('Skipping file %s\n', rawFiles{ind});
      continue;
    endif
    #keyboard;
    [s, e] = regexp (rawFiles{ind}, '0|[1-9][0-9]*');
    [s1, e1] = regexp (rawFiles{ind}, '\_[1-9][0-9]*');

    #keyboard;
    timestampLabel = rawFiles{ind}(s:e);
    extensionLabel = rawFiles{ind}(s1:e1);
    printf('>>>> Reading %s\n', rawFiles{ind});

    [accX, accY, accZ, timestamp, label] = textread([config.dataPath, rawFiles{ind}], "%f %f %f %f %s", 'headerlines', 1, "delimiter", ",");
    m = numel(accX);

    printf('>>>> Size of file read: %d\n', m);
    if (m == 0)
      continue;
    endif

    % Transform timestamps
    timestampStr = cell(m, 1);
    for tx = 1 : m-1
      timestampStr{tx} = formatTime(timestamp(tx) ./ 1000);
    endfor;

  %keyboard;

    % Filter raw data
    accFX = lowpass(accX, featureConfig.fs, featureConfig.fc);
    accFY = lowpass(accY, featureConfig.fs, featureConfig.fc);
    accFZ = lowpass(accZ, featureConfig.fs, featureConfig.fc);

    % Plot accX accY accZ
    %plotAccX(timestampStr, accX, accFX);
    printf(">>>> size(accFX)=%d, size(accFY)=%d, size(accFZ)=%d, length(timestamp)=%d\n", length(accFX), length(accFY), length(accFZ), length(timestamp));

  %  if (mode == 0)
  %  else if (mode == 1)

  %  endif

    % Extract vertical and horizontal component through gravity estimated vector
    [V, H] = testGravityNorm(timestamp, [accFX, accFY, accFZ]);

    writeToFile(timestampLabel, [V,H], config);

    if (strcmp (rawFiles{ind}, "acceleration.data.log.1456658861011_6.csv") == 1)
      keyboard
    endif

    iidV = segment(V, featureConfig.overlap, timestamp, featureConfig.maxWindowSamples, featureConfig.wnMSecs);
    iidH = segment(H, featureConfig.overlap, timestamp, featureConfig.maxWindowSamples, featureConfig.wnMSecs);

    %keyboard;
    % Calculate features using matrix X
    X=[];
    for n=1:size(iidV,1)
          % gravity estimation
          try

            vFrame = V(iidV(n, 1):iidV(n, 2));
            hFrame = H(iidH(n, 1):iidH(n, 2));
          catch err
            warning(err.identifier, err.message);
            keyboard;
            exit
          end_try_catch

          % Statistical features
          frame = [vFrame, hFrame];
          freq = [iidV(n, 1):iidV(n, 2); iidH(n, 1):iidH(n, 2)];

          m = mean(frame, 1);
          s = std(frame, 0);
          v = var(frame, 0);
          md = mean(abs (frame - m), 1);

          % **** Time features ****
          Ct = centroid(frame, freq);
          St = spread(frame, freq, Ct);
          Wt = skewness(frame, freq, Ct, St);
          Kt = kurtosis(frame, freq, Ct, St);

          % Zero crossing rate
          zcr = ZCR(frame);

          % Root mean square
          rms = (1./sqrt(length(frame))).*sum(frame.^2).^(1/2);

          % Autocorrelation coefficients 12
          correlation = [xcorr(vFrame), xcorr(hFrame)];
          correlation = correlation(1:12,:); % how to use?

          % Frequency Features
          N = length(freq);
          TInterval = (timestamp(iidV(n,2))-timestamp(iidV(n,1)))/1000;

          freq1 = 100;
          num_tsteps = length(freq);
          num_periods = 2;

          [Y , f] = spectrum(frame, freq1, num_tsteps, num_periods);
          Cf = centroid(Y, f);
          Sf = spread(Y, f, Cf);
          Wf = skewness(Y, f, Cf, Sf);
          Kf = kurtosis(Y, f, Cf, Sf);
          sEntropy = spectralEntropy(Y);
          pS = (powerSpectrum(f, Y))(1:12);
  %keyboard;

          % Compose the features array
          X = [X; m, s, v, md, zcr, rms, correlation(:, 1)', correlation(:, 2)', pS, sEntropy, Cf, Sf, Wf, Kf, Ct, St, Wt, Kt];
    endfor;

    % Normalize data
    %keyboard;
    XNorm = featureNormalize(X);
    size(XNorm);
    % Save prepared data
    fileID = fopen([config.outputPath, '/feature_', timestampLabel, extensionLabel, '.csv'],'w');
    XNorm(XNorm==0) = 1;
    fprintf(fileID, "mV, mH, stdV, stdH, varV, varH, mdV, mdH, zcrV, zcrH, rmsV, \
            corrV1, corrV2, corrV3, corrV4, corrV5, corrV6, corrV7, corrV8, corrV9, corrV10, corrV11, corrV12, \
            corrH1, corrH2, corrH3, corrH4, corrH5, corrH6, corrH7, corrH8, corrH9, corrH10, corrH11, corrH12, \
            ps1, ps2, ps3, ps4, ps5, ps6, ps7, ps8, ps9, ps10, ps11, ps12, \
            sEntropyV, sEntropyH, CfV, CfH, SfV, SfH, WfV, WfH, KfV, KfH, CtV, CtH, StV, StH, WtV, WtH, KtV, KtH, class\n");

    for i=1:size(XNorm, 1)
    %keyboard;
     fprintf(fileID, '%5f,', XNorm(i, 1:size(XNorm, 2)));
     fprintf(fileID, '%s', label{1});
     fprintf(fileID, '\n');
    end;
    fclose(fileID);

  endfor;

  pause;
endfunction;
